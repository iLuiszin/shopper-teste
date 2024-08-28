import ReadingController from "../controllers/ReadingController";
import { Router } from "express";

const route: Router = Router();

route.post('/', ReadingController.upload);


