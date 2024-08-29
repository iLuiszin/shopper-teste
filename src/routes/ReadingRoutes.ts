import ReadingController from "../controllers/ReadingController";
import { Router } from "express";

const route: Router = Router();

route.post('/upload', ReadingController.upload);

export default route;