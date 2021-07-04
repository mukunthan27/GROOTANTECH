const fs = require("fs");
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require("cors");
const multer = require("multer");
const fastcsv = require("fast-csv");

const path = require("path")

const PORT = process.env.PORT || 8080;

const { clients } = require("./models/client.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

mongoose.connect('mongodb://localhost:27017/CSV', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
  if (!err) {
    console.log("Database Connected");
  }
  else {
    console.log("Error in connecting Database ", +err);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/")
  },
  filename: (req, file, cb) => {
    cb(null);
  }
});

var upload = multer({ storage: storage });

// post route to insert a document

app.post("/UploadCsvFile", upload.single("file"), (req, res) => {

  var file = req.file;
  var csvFile = file.filename;
  let csvData = [];
  let stream = fs.createReadStream(`./uploads/${csvFile}`);
  let csvStream = fastcsv.parse().on("data", (data) => {
    csvData.push({
      Order_id: data[0],
      Item_type: data[1],
      Order_date: data[2],
      Ship_date: data[3],
      Cost: data[4]
    });
  }).on("end", async () => {
    // remove the first line: header
    csvData.shift();

    // insert a data

    const success = await clients.create(csvData);
    try {
      console.log("Inserted: 100000 rows");

      // send data to frontend 

      res.json(success);
    }
    catch (err) {
      console.log(err);
    }
  });
  stream.pipe(csvStream);
});
app.use(express.static(path.join(__dirname, "public")))
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
})
app.listen(PORT, () => console.log("server started at port " + PORT));