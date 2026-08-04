import { Router } from "express";
import healthController from "../controllers/healthController"
const router=Router();

router.get("/", (req, res) => {
    res.send("Backend is running! yoooooiii");
});
//all the parsing is done by express.json() middleware in server.ts file
//":name" is a variable that is used to take input from the user
//and its acessed using req.params.name
router.get("/api/greet/:name", (req, res) => {
    const name = req.params.name;
    res.json({
        message: `Hello ${name}!`
    });
});

router.get("/api/search", (req, res) => {
    const query = req.query.query;
    if(!query) {
        return res.json({
            search: "Nothing provided"
        });
    }
    res.json({
        search: query
    });
});

router.post("/api/echo", (req, res) => {
    const body = req.body;
    res.json(body);
});

//this down is old it was updated but i kept it to show it was like this before
// router.get("/health", (req, res) => {
//     res.json({
//         status: "OK"
//     });
// });

router.use("/health",healthController);

// //this function is for testing(should be removed later)
// router.get("/crash", (req, res) => {
//     throw new Error("Something went wrong bro!");
// });

export default router;