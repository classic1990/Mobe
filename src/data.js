import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from "firebase/firestore";

import { db } from "./firebase.js";

const moviesRef = collection(db, "movies");

export async function getMovies({
  max = 24,
  genre = null,
  search = null
} = {}) {

  let snap;

  try {
    const q = query(
      moviesRef,
      orderBy("createdAt", "desc"),
      limit(max)
    );

    snap = await getDocs(q);

  } catch (error) {

    console.warn(
      "getMovies ordered query failed, trying simple query:",
      error
    );

    snap = await getDocs(
      query(moviesRef, limit(max))
    );
  }

  let items = snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));

  // รองรับข้อมูลเก่าที่ไม่มี status
  items = items.filter((movie) => {
    if (!movie.status) return true;

    return (
      movie.status === "published" ||
      movie.status === "active"
    );
  });

  // กรองหมวดหมู่
  if (genre) {
    items = items.filter((movie) => {

      const genres = movie.genres || [];

      if (Array.isArray(genres)) {
        return genres.includes(genre);
      }

      if (typeof genres === "string") {
        return genres === genre;
      }

      return (
        movie.category === genre ||
        movie.genre === genre
      );
    });
  }

  // ค้นหา
  if (search) {

    const s = search.toLowerCase().trim();

    items = items.filter((movie) => {

      const text = [
        movie.title,
        movie.titleTH,
        movie.name,
        movie.nameTH,
        movie.description,
        movie.category
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(s);
    });
  }

  return items;
}


export async function getMovie(id) {

  if (!id) return null;

  const snap = await getDoc(
    doc(db, "movies", id)
  );

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data()
  };
}


export async function getSources(movieId) {

  if (!movieId) return [];

  const ref = collection(
    db,
    "movies",
    movieId,
    "sources"
  );

  try {

    const snap = await getDocs(
      query(
        ref,
        orderBy("priority", "asc")
      )
    );

    return snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data()
      }))
      .filter((source) => source.active !== false);

  } catch (error) {

    console.warn(
      "getSources ordered query failed:",
      error
    );

    const snap = await getDocs(ref);

    return snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data()
      }))
      .filter((source) => source.active !== false);
  }
}


export async function createMovie(data) {

  const ref = await addDoc(
    moviesRef,
    {
      ...data,

      views: Number(data.views || 0),

      rating: Number(data.rating || 0),

      ratingCount: Number(
        data.ratingCount || 0
      ),

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp()
    }
  );

  return ref.id;
}


export async function updateMovie(id, data) {

  if (!id) {
    throw new Error("Movie ID is required");
  }

  await updateDoc(
    doc(db, "movies", id),
    {
      ...data,
      updatedAt: serverTimestamp()
    }
  );
}


export async function removeMovie(id) {

  if (!id) {
    throw new Error("Movie ID is required");
  }

  await deleteDoc(
    doc(db, "movies", id)
  );
}


export async function saveSource(movieId, data) {

  if (!movieId) {
    throw new Error("Movie ID is required");
  }

  return addDoc(
    collection(
      db,
      "movies",
      movieId,
      "sources"
    ),
    {
      ...data,

      priority: Number(
        data.priority || 1
      ),

      active: data.active !== false,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp()
    }
  );
}


export async function deleteSource(
  movieId,
  sourceId
) {

  if (!movieId || !sourceId) {
    throw new Error(
      "Movie ID and Source ID are required"
    );
  }

  await deleteDoc(
    doc(
      db,
      "movies",
      movieId,
      "sources",
      sourceId
    )
  );
}


export async function incrementViews(movieId) {

  if (!movieId) return;

  await updateDoc(
    doc(db, "movies", movieId),
    {
      views: increment(1)
    }
  );
}


export async function getGenres() {

  try {

    const snap = await getDocs(
      collection(db, "genres")
    );

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

  } catch (error) {

    console.warn(
      "getGenres:",
      error
    );

    return [];
  }
}


export async function getSeries(max = 24) {

  try {

    const snap = await getDocs(
      query(
        collection(db, "series"),
        limit(max)
      )
    );

    let items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    items = items.filter((item) => {
      if (!item.status) return true;

      return (
        item.status === "published" ||
        item.status === "active"
      );
    });

    return items;

  } catch (error) {

    console.error(
      "getSeries:",
      error
    );

    return [];
  }
}
