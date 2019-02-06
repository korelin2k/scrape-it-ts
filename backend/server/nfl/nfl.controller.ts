import axios from "axios";
import * as bodyParser from "body-parser";
import * as cheerio from "cheerio";
import * as express from "express";
import { authorize } from "../config";
import NFL from "./nfl.model";

const router = express.Router();

router.route("/").get(authorize, async (request, response) => {
    const stories = await NFL.find();
    return response.status(200).json(stories);
});

router.route("/update/").put(authorize, bodyParser.json(), (request, response) => {
    console.log("hey");
    try {
        const headLine = request.body.contentHeadLine;
        const comments = request.body.comment;

        NFL.findOneAndUpdate({headLine: headLine}, { $push: { comments: comments } }, {new: true}, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
        
            return response.status(200).json("Story updated!");           
        });
    } catch (error) {
        return response.status(400).send(error);
    }
});

router.route("/removecomment/").put(authorize, bodyParser.json(), (request, response) => {
    console.log("hey");
    try {
        const headLine = request.body.headLine;
        const comment = request.body.comment;

        NFL.findOneAndUpdate({headLine: headLine}, { $pull: { comments: { $in: [comment] } } }, {new: true}, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
        
            return response.status(200).json("Comment updated!");           
        });
    } catch (error) {
        return response.status(400).send(error);
    }
});

router.route("/scrape").get(authorize, async (request, response) => {
    axios.get("https://sports.yahoo.com/nfl/")
        .then((res) => {
            if (res.status === 200) {
                const html = res.data;
                // console.log(html);
                const $ = cheerio.load(html);

                $(".js-stream-content").each(async function (i, element) {
                    const link = $(element).find("a").attr("href");
                    const image = $(element).find("img").attr("src");
                    const title = $(element).find("h4").text();

                    const newStory = {
                        headLine: title,
                        url: link,
                        picture: image
                    }

                    const story = new NFL(newStory);
                    try {
                        await story.save();
                    } catch {
                        console.log("Story already added");
                    }
                });

                return response.status(200).json("Stories scraped!");
            }
        }, (err) => console.log(err));
});

export default router;
