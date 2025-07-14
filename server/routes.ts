import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertRewardSchema, 
  insertEventSchema, 
  insertReportSchema, 
  insertNewsAlertSchema 
} from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static(uploadDir));
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users/:id/points", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points } = req.body;
      const user = await storage.updateUserPoints(userId, points);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: "Failed to update points" });
    }
  });

  app.get("/api/users/:id/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Rewards routes
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  });

  app.post("/api/rewards", async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: "Failed to create reward" });
    }
  });

  app.put("/api/rewards/:id", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const updates = req.body;
      const reward = await storage.updateReward(rewardId, updates);
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reward" });
    }
  });

  app.delete("/api/rewards/:id", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const success = await storage.deleteReward(rewardId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reward" });
    }
  });

  // Reward claims routes
  app.post("/api/rewards/:id/claim", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const { userId } = req.body;
      
      // Check if user has enough points
      const user = await storage.getUser(userId);
      const reward = await storage.getReward(rewardId);
      
      if (!user || !reward) {
        return res.status(404).json({ error: "User or reward not found" });
      }
      
      if (user.points < reward.pointsCost) {
        return res.status(400).json({ error: "Insufficient points" });
      }
      
      // Deduct points and create claim
      await storage.updateUserPoints(userId, user.points - reward.pointsCost);
      const claim = await storage.createRewardClaim(userId, rewardId);
      
      // Create transaction
      await storage.createTransaction({
        userId,
        type: "redeemed",
        amount: -reward.pointsCost,
        description: `Redeemed: ${reward.title}`,
        rewardId,
        claimId: claim.id,
        eventId: null,
      });
      
      res.json(claim);
    } catch (error) {
      res.status(500).json({ error: "Failed to claim reward" });
    }
  });

  app.get("/api/reward-claims", async (req, res) => {
    try {
      const claims = await storage.getRewardClaims();
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reward claims" });
    }
  });

  app.get("/api/users/:id/reward-claims", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const claims = await storage.getUserRewardClaims(userId);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user reward claims" });
    }
  });

  app.post("/api/reward-claims/:id/verify", async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const { status, verifiedBy } = req.body;
      const claim = await storage.updateRewardClaimStatus(claimId, status, verifiedBy);
      res.json(claim);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify claim" });
    }
  });

  app.get("/api/reward-claims/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const claim = await storage.getRewardClaimByCode(code);
      
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }
      
      res.json(claim);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch claim" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const updates = req.body;
      const event = await storage.updateEvent(eventId, updates);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Event participants routes
  app.post("/api/events/:id/join", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { userId } = req.body;
      const participant = await storage.joinEvent(eventId, userId);
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to join event" });
    }
  });

  app.get("/api/events/:id/participants", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const participants = await storage.getEventParticipants(eventId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  app.get("/api/users/:id/events", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const participations = await storage.getUserEventParticipations(userId);
      res.json(participations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user events" });
    }
  });

  app.put("/api/event-participants/:id", async (req, res) => {
    try {
      const participantId = parseInt(req.params.id);
      const updates = req.body;
      const participant = await storage.updateEventParticipant(participantId, updates);
      
      // If approving participation, award points
      if (updates.status === "approved" && updates.pointsAwarded) {
        const user = await storage.getUser(participant.userId);
        if (user) {
          await storage.updateUserPoints(participant.userId, user.points + updates.pointsAwarded);
          
          // Create transaction
          await storage.createTransaction({
            userId: participant.userId,
            type: "earned",
            amount: updates.pointsAwarded,
            description: `Event participation approved`,
            eventId: participant.eventId,
            rewardId: null,
            claimId: null,
          });
        }
      }
      
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to update participant" });
    }
  });

  // Reports routes
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", upload.single('image'), async (req, res) => {
    try {
      console.log("Received report data:", req.body);
      console.log("Received file:", req.file);
      
      const reportData = {
        userId: parseInt(req.body.userId),
        title: req.body.title,
        description: req.body.description,
        locationAddress: req.body.locationAddress,
        locationLat: parseFloat(req.body.locationLat),
        locationLng: parseFloat(req.body.locationLng),
        status: req.body.status,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : "/placeholder.svg"
      };
      
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.put("/api/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const updates = req.body;
      const report = await storage.updateReport(reportId, updates);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  // News & Alerts routes
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getAllNewsAlerts();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const newsData = insertNewsAlertSchema.parse(req.body);
      const { authorId } = req.body;
      const news = await storage.createNewsAlert({ ...newsData, authorId });
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to create news" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
