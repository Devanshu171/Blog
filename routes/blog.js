const { render } = require("ejs");
const express = require("express");
const { pid } = require("process");

const db = require("../data/database");
const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});
router.get("/posts", async function (req, res) {
  const [posts] = await db.query(
    "SELECT posts.*,authors.name AS author_name FROM posts INNER JOIN authors ON posts.author_id=authors.id"
  );
  res.render("posts-list", { posts: posts });
});
router.get("/new-post", async function (req, res) {
  // sql query
  // here we use asyncronous js as getting the authors info
  // will take some time so we added promise while importing mysql2
  // and async before function and await before the line of code for which
  // we need to wait till we get data and send response with it
  // the data that will be fetched will be an array with record that it fetched
  // so we will use array destracturing
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const postData = req.body;
  const data = [
    postData.title,
    postData.summary,
    postData.content,
    postData.author,
  ];
  // we mark values as (?) and add another parameter i.e array containing an array containing an array containing all  data in same order
  await db.query(
    "INSERT INTO posts (title,summary,body,author_id)  VALUES(?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const pId = req.params.id;
  const q = `SELECT posts.*,authors.name AS author_name,authors.email AS author_email FROM posts INNER JOIN authors ON posts.author_id=authors.id WHERE posts.id=?`;
  const [post] = await db.query(q, [pId]);

  if (!post || post.length === 0) return res.status(404).render("404");

  const postData = {
    ...post[0],
    date: post[0].date.toISOString(),
    hrDate: post[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function (req, res) {
  const query = `
  SELECT * FROM posts WHERE id=?
  `;
  const [post] = await db.query(query, [req.params.id]);
  if (!post || post.length === 0) return res.status(404).render("404");

  res.render("update-post", { post: post[0] });
});
router.post("/posts/update/:id", async function (req, res) {
  const post = req.body;
  const pId = req.params.id;
  const query = `
  UPDATE posts
  SET title=?,
  summary=?,
  body=?
  WHERE id=?
  `;
  await db.query(query, [post.title, post.summary, post.content, pId]);

  res.redirect("/posts");
});
router.post("/posts/:id/delete", async function (req, res) {
  const query = `
    DELETE FROM posts
    WHERE id=?
    `;
  db.query(query, [req.params.id]);
  res.redirect("/posts");
});

module.exports = router;
