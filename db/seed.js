import db from "#db/client";

import { createUser } from "#db/queries/users";
import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  //Create two users
  const alice = await createUser("alice", "password123");
  const bob = await createUser("bob", "secure456");

  //Create 20 tracks
  for (let i = 1; i <= 20; i++) {
    await createTrack("Track " + i, i * 50000);
  }

  //Create 10 playlists for Alice, and 10 for bob
  for (let i = 1; i <= 20; i++) {
    const userId = i <= 10 ? alice.id : bob.id;
    await createPlaylist(
      "Playlist " + i,
      "lorem ipsum playlist description",
      userId
    );
  }

  //add 15 track assignments to playlist
  for (let i = 1; i <= 15; i++) {
    const playlistId = 1 + Math.floor(i / 2);
    await createPlaylistTrack(playlistId, i);
  }
}
