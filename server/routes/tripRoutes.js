const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/tripsController");

router.use(auth);

router.post("/", controller.createTrip);
router.get("/", controller.getTrips);
router.get("/:tripId", controller.getTripDetails);
router.post("/:tripId/itinerary", controller.addItineraryItem);
router.delete("/itinerary/:itemId", controller.deleteItineraryItem);
router.patch("/:tripId/status", controller.updateTripStatus);
router.post("/destinations/:destinationId/vote", controller.voteDestination);

module.exports = router;