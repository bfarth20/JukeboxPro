import express from "express";
const router = express.Router();
export default router;

import {
  getTracks,
  getTrackById,
  getPlaylistsByTrackIdForUser,
} from "#db/queries/tracks";
import requireUser from "../middleware/requireUser";

// GET /tracks/
router.route("/").get(async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

// GET /tracks/:id
router.route("/:id").get(async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  res.send(track);
});

// 🔒 GET /tracks/:id/playlists
router.get("/:id/playlists", requireUser, async (req, res, next) => {
  try {
    const trackId = Number(req.params.id);
    if (isNaN(trackId)) return res.status(400).send("Invalid track ID.");
    const userId = req.user.id;

    const track = await getTrackById(trackId);
    if (!track) return res.status(404).send("Track not found.");

    const playlists = await getPlaylistsByTrackIdForUser(trackId, userId);
    res.send(playlists);
  } catch (err) {
    next(err);
  }
});
