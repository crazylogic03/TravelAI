const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/bookController");

router.use(auth);
router.post("/", controller.addBooking);
router.get("/:tripId", controller.getBookings);

module.exports = router;