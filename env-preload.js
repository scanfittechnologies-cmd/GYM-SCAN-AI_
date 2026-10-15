// env-preload.js — must be the FIRST import in server.js so that
// dotenv populates process.env before any other module reads it.
// ES module imports are hoisted; this file's side-effect (dotenv.config)
// therefore runs before recognitionConfig.js reads process.env.
import dotenv from 'dotenv';
dotenv.config();
