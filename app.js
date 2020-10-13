//jshint esversion:6

//Adding dependencies
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Setting up MongoDB
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser:true});
const itemSchema = {
  name : String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to my to do list!'
});
const item2 = new Item({
  name: 'Hit the + button to add  a new item!'
});
const item3 = new Item({
  name: ' <-- Hit this to delete!'
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemSchema]
}

const List = mongoose.model('List', listSchema);


//Rendering default page
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){ 
  if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else {
          console.log('Success!');
        }
      });
      res.redirect('/');
    } else {
    res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }
  });
  
});

//POST method
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName==='Today'){
  item.save();
  res.redirect('/');
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    })
  }
});

app.post('/delete', function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
  Item.findByIdAndRemove(checkItemId, function(err){
    if(!err){
    res.redirect('/');
    }
  });
  } else {
    List.findOneAndUpdate({name : listName}, {$pull: {items : {_id : checkItemId}}}, function(err, foundList){
      if(!err){
        res.redirect('/' + listName);
      }
    });
  }
});



app.get('/:customListName', function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
    name : customListName,
    items: defaultItems
  });
    list.save();
    res.redirect('/'+ customListName);
      }
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

//Rendering work page
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

//Rendering about page
app.get("/about", function(req, res){
  res.render("about");
});

//Setting up localhost
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
