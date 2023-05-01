//jshint esversion:6

const express = require("express");
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Create new DB in mongoDB
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://saikrishnamodhupalli1:Sai$12345@cluster0.6p9zs1a.mongodb.net/todolistDB');
}
const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome1"
});

const item2 = new Item({
  name: "Welcome2"
});

const item3 = new Item({
  name: "Welcome3"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);



app.get("/", function (req, res) {

  //const day = date.getDate();
  Item.find()
    .then(function (Litems) {
      if (Litems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully inserted");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/")
      }
      else {
        res.render("index", { listTitle: "Today", newListItems: Litems });
      }

    });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName})
    .then(function(foundList){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("index", { listTitle: foundList.name, newListItems: foundList.items});
      }
    });
 
})

app.post("/", function (req, res) {

  const nitem = req.body.newItem;
  const lname= req.body.list;
  const item = new Item({
    name: nitem
  });

  if(lname === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:lname})
      .then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+lname);
      })
  }
 

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);

 if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId)
  .then(() => {
    console.log("Deleted Successfully");
  })
  .catch((err) => {
    console.log("Not Deleted");
  });
  res.redirect("/");
 }else{
  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}})
  .then(function (foundList)
  {
    res.redirect("/" + listName);
  }).catch( err => console.log(err));
}
 });

app.get("/work", function (req, res) {
  res.render("index", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000 || process.env.PORT, function () {
  console.log("Server started on port 3000");
});
