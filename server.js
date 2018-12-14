var express = require("express");
var mongojs = require("mongojs");
var cors = require("cors");

var db = mongojs("poc_db");
var collection = db.collection("pokemons");

const app = express();

app.use(cors());

const pokemonUniqueIdExtractPipeline = {
  $group: {
    _id: "$number",
    name: { $first: "$name" },
    type: { $first: "$type" },
    image: { $first: "$ThumbnailImage" }
  }
};

const idIncrementalSortPipeline = { $sort: { _id: 1 } };

app.get("/pokemons/:type1/:type2", function(req, res) {
  if (req.params.type1 == "any" && req.params.type2 == "any") {
    collection.aggregate(
      pokemonUniqueIdExtractPipeline,
      idIncrementalSortPipeline,
      function(err, docs) {
        res.json(docs);
      }
    );
  } else if (req.params.type1 == "any" && req.params.type2 == "none") {
    collection.aggregate(
      {
        $match: { type: { $size: 1 } }
      },
      pokemonUniqueIdExtractPipeline,
      idIncrementalSortPipeline,
      function(err, docs) {
        res.json(docs);
      }
    );
  } else if (req.params.type1 == "any") {
    collection.aggregate(
      {
        $match: { type: req.params.type2 }
      },
      pokemonUniqueIdExtractPipeline,
      idIncrementalSortPipeline,
      function(err, docs) {
        res.json(docs);
      }
    );
  } else if (req.params.type2 == "any") {
    collection.aggregate(
      {
        $match: { type: req.params.type1 }
      },
      pokemonUniqueIdExtractPipeline,
      idIncrementalSortPipeline,
      function(err, docs) {
        res.json(docs);
      }
    );
  } else if (req.params.type2 == "none") {
    collection.aggregate(
      {
        $match: { type: [req.params.type1] }
      },
      pokemonUniqueIdExtractPipeline,
      idIncrementalSortPipeline,
      function(err, docs) {
        res.json(docs);
      }
    );
  } else {
    collection.aggregate(
      {
        $match: { type: { $all: [req.params.type1, req.params.type2] } }
      },
      pokemonUniqueIdExtractPipeline,
      idIncrementalSortPipeline,
      function(err, docs) {
        res.json(docs);
      }
    );
  }
});

app.listen(4000);
