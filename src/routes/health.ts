import { Router } from "express";

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

export default router;