import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.json(restaurant);
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ message: "Error fetching restaurant" });
    }
};

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({ user: req.userId });

        if (existingRestaurant) {
            return res.status(409).json({ message: "User restaurant already exists" });
        }

        const image = req.file as Express.Multer.File;

        if (!image) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

        const newRestaurant = new Restaurant({
            ...req.body,
            imageUrl: uploadResponse.url,
            user: new mongoose.Types.ObjectId(req.userId),
            lastUpdated: new Date(),
        });

        await newRestaurant.save();

        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



export default { getMyRestaurant, createMyRestaurant };
