const express = require("express");
const app = express();
const { body, validationResult } = require("express-validator");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const path = require("path");
const port = 3000;

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")),
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")),
);

// app.set("view engine", "ejs");

// Routing dasar
// app.get('/', (req, res) => {
//     res.send('Hello World! Server Express sudah asdasd.');
// });

app.get("/", (req, res) => {
  // Data ini seolah-olah berasal dari database
  const dataUser = { namaPengguna: "Peserta Pelatihan" };
  res.render("index", dataUser);
});

app.get("/tentang", (req, res) => {
  res.render("tentang");
});

app.get("/karyawan", (req, res) => {
  const dataKaryawan = [
    { id: 1, nama: "Budi Santoso", divisi: "IT" },
    { id: 2, nama: "Siti Aminah", divisi: "Finance" },
    { id: 3, nama: "Agus Setiawan", divisi: "Marketing" },
  ];
  res.render("karyawan", { listKaryawan: dataKaryawan });
});

// GET method route
app.get("/route", (req, res) => {
  res.send("GET request to the homepage");
});

// POST method route
app.post("/route", (req, res) => {
  res.send("POST request to the homepage");
});

// Form
app.get("/form", (req, res) => {
  res.render("form");
});

app.post(
  "/submit-form",
  [
    body("nama").trim().notEmpty().withMessage("Nama tidak boleh kosong"),
    body("email").trim().isEmail().withMessage("Format email tidak valid"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("form", {
        errors: errors.array(),
      });
    }
    res.render("form-success", {
      nama: req.body.nama,
      email: req.body.email,
    });
  },
);

app.get("/tes", (req, res) => {
  res.send("Tes.");
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
