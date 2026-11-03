require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const app = express();
const { body, validationResult } = require("express-validator");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const path = require("path");
const port = process.env.PORT || 3000;

// Membuat isi folder public bisa diakses melalui URL
app.use(express.static(path.join(__dirname, "public")));

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
const validasiBarang = [
  body("nama").isString().bail().trim().notEmpty(),
  body("harga").isString().bail().isInt({ min: 0, max: 2147483647 }),
  body("stok").isString().bail().isInt({ min: 0, max: 2147483647 }),
];

function cekDataBarang(req, res, next) {
  if (!validationResult(req).isEmpty()) {
    return res
      .status(422)
      .type("text/plain")
      .send("Data tidak valid. Isi nama, harga, dan stok dengan benar.");
  }
  next();
}

function cekIdBarang(req, res, next) {
  const id = Number(req.params.id);
  if (
    !/^[0-9]+$/.test(req.params.id) ||
    !Number.isInteger(id) ||
    id < 1 ||
    id > 2147483647
  ) {
    return res.status(400).type("text/plain").send("ID barang tidak valid.");
  }
  req.barangId = id;
  next();
}

app.get("/barang", async (req, res, next) => {
  try {
    const barangs = await prisma.barang.findMany({ orderBy: { id: "asc" } });
    res.render("barang", { listBarang: barangs });
  } catch (err) {
    next(err);
  }
});
app.get("/barang/tambah", (req, res) => {
  res.render("tambah-barang");
});

app.post(
  "/barang/tambah",
  validasiBarang,
  cekDataBarang,
  async (req, res, next) => {
    try {
      const { nama, harga, stok } = req.body;
      await prisma.barang.create({
        data: { nama, harga: Number(harga), stok: Number(stok) },
      });
      res.redirect("/barang");
    } catch (err) {
      next(err);
    }
  },
);

app.get("/barang/edit/:id", cekIdBarang, async (req, res, next) => {
  try {
    const barang = await prisma.barang.findUnique({
      where: { id: req.barangId },
    });
    if (!barang) {
      return res.status(404).type("text/plain").send("Barang tidak ditemukan.");
    }
    res.render("edit-barang", { b: barang });
  } catch (err) {
    next(err);
  }
});

app.post(
  "/barang/edit/:id",
  cekIdBarang,
  validasiBarang,
  cekDataBarang,
  async (req, res, next) => {
    try {
      const { nama, harga, stok } = req.body;
      await prisma.barang.update({
        where: { id: req.barangId },
        data: { nama, harga: Number(harga), stok: Number(stok) },
      });
      res.redirect("/barang");
    } catch (err) {
      next(err);
    }
  },
);

app.post("/barang/hapus/:id", cekIdBarang, async (req, res, next) => {
  try {
    await prisma.barang.delete({
      where: { id: req.barangId },
    });
    res.redirect("/barang");
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "P2025") {
    return res
      .status(404)
      .type("text/plain")
      .send("Barang tidak ditemukan atau sudah dihapus.");
  }
  console.error(err.message);
  res
    .status(500)
    .type("text/plain")
    .send("Operasi gagal. Periksa koneksi dan pesan pada terminal.");
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
