const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/tripController");

router.use(auth);

router.post("/", controller.createTrip);
router.get("/", controller.getTrips);
router.get("/:tripId", controller.getTripDetails);
router.post("/:tripId/destinations", controller.addDestination);
router.post("/destinations/:destId/vote", controller.voteDestination);

module.exports = router;