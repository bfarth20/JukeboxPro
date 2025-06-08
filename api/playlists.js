import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";

import {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
} from "../db/queries/playlists.js";
import {
  createPlaylistTrack,
  getTracksByPlaylistId,
} from "../db/queries/playlists_tracks.js";

const router = express.Router();

// 🔒 Require login for all routes
router.use(requireUser);

// GET /playlists - get all playlists owned by the user
router.get("/", async (req, res) => {
  try {
    const all = await getPlaylists();
    const owned = all.filter((p) => p.user_id === req.user.id);
    res.send(owned);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not fetch playlists.");
  }
});

// POST /playlists - create new playlist owned by user
router.post("/", requireBody(["name", "description"]), async (req, res) => {
  const { name, description } = req.body;
  try {
    const newPlaylist = await createPlaylist(name, description, req.user.id);
    res.status(201).send(newPlaylist);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not create playlist.");
  }
});

// GET /playlists/:id - must own the playlist
router.get("/:id", async (req, res) => {
  const playlist = await getPlaylistById(req.params.id);
  if (!playlist) return res.status(404).send("Playlist not found.");
  if (playlist.user_id !== req.user.id)
    return res.status(403).send("Forbidden.");
  res.send(playlist);
});

// GET /playlists/:id/tracks - must own the playlist
router.get("/:id/tracks", async (req, res) => {
  const playlist = await getPlaylistById(req.params.id);
  if (!playlist) return res.status(404).send("Playlist not found.");
  if (playlist.user_id !== req.user.id)
    return res.status(403).send("Forbidden.");

  try {
    const tracks = await getTracksByPlaylistId(req.params.id);
    res.send(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Could not fetch tracks.");
  }
});

//POST /playlists/:id/tracks
router.post("/:id/tracks", async (req, res) => {
  const { id } = req.params;
  const { trackId } = req.body;

  try {
    const playlist = await getPlaylistById(id);
    if (!playlist) return res.status(404).send("Playlist not found.");
    if (playlist.user_id !== req.user.id)
      return res.status(403).send("Forbidden.");

    const newTrack = await createPlaylistTrack(id, trackId);

    res.status(201).send("Track added.");
  } catch (err) {
    console.error("🚨 Error in POST /playlists/:id/tracks:", err);
    res.status(500).send("Server error.");
  }
});

export default router;
