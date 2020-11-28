var express = require("express");
var path = require("path");
var mysql = require("mysql");
var nodemailer = require("nodemailer");
const { route } = require("./refernce");

router.use(express.static(__dirname + "./public/"));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbms5",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("database connected successfully");
});



var router = express.Router();

app.get("/",function(req,res){
  con.connect(function(err) {
  if (err) throw err;
  var getQuery = "SELECT * FROM books";
  con.query(getQuery, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render("home.ejs",{
      result:result
    });
  });
});
})

router.get("/", function (req, res) {
  res.render("home", {
    authenticated: authenticated,
  });
});

router.get("/signup", function (req, res) {
  if (!authenticated) {
    res.render("signup");
  } else {
    res.redirect("/login");
  }
});

router.get("/login", function (req, res) {
  res.render("login", {
    title: "Login Page",
    success: "",
  });
});

router.get("/adminlogin", function (req, res) {
  res.render("adminlogin", {
    title: "Login Page",
    success: "",
  });
});

router.get("/logout", function (req, res) {
  authenticated = false;
  res.redirect("/");
});

var authenticated = false;
var userauth;
var checkuser = "select max(userId) as maxUserId from user";
con.query(checkuser,function(err,response)
{
  userauth = response[0].maxUserId + 1;
})
var newUserId;
var selectedBranch;
var selectedCity;
var selectedCar;

router.post("/login", function (req, res) {
  if (authenticated == false) {
    var email = req.body.email;
    var password = req.body.password;
    var check = "Select * from user where email = ? and password = ?";
    var queryCheck = mysql.format(check, [email, password]);
    con.query(queryCheck, function (err, response) {
      if (err) throw err;
      if (response != "") {
        authenticated = true;
        userauth = response[0].userId;
        // console.log(userauth);
        var checking = "select * from user2 where driving = ?";
        var queryCheck2 = mysql.format(checking,[response[0].driving]);
        con.query(queryCheck2,function(err,response)
        {
        console.log(response[0].first);
        var nameOnLanding = response[0].first;
        res.render("landing",{
          nameOnLanding:nameOnLanding,
        });
        })
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.render("landing",{
      nameOnLanding:nameOnLanding,
    });
  }
});

router.post("/registering", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var driving = req.body.driving;
  var first = req.body.first;
  var last = req.body.last;
  var dob = req.body.dob;
  var gender = req.body.gender;
  var state = req.body.state;
  var city = req.body.city;
  var pincode = Number(req.body.pincode);
  var phone = Number(req.body.phone);

  // var insertQuery3 =
  //   "insert into `user3` (`state`,`city`,`pincode`) VALUES (?,?,?)";
  // var query3 = mysql.format(insertQuery3, [state, city, pincode]);
  var insertQuery2 =
    "insert into `user2` (`first`,`last`,`driving`,`dob`,`gender`,`state`) VALUES (?,?,?,?,?,?)";
  var query2 = mysql.format(insertQuery2, [
    first,
    last,
    driving,
    dob,
    gender,
    state,
  ]);

  var insertQuery =
    "insert into `user` (`email`,`password`,`driving`,`phone`) VALUES (?,?,?,?)";
  var query = mysql.format(insertQuery, [email, password, driving, phone]);

  // var insertQuery4 =
  //   "insert into `user4` (`user`,`city`,`pincode`) VALUES (?,?,?)";

  con.query(query2, function (err, response) {
    if (err) throw err;

    con.query(query, function (err, response) {
      if (err) throw err;

      newUserId = response.insertId;
      var insertQuery3 = "insert into `user4` (`userId`,`city`) VALUES (?,?)";
      var query3 = mysql.format(insertQuery3, [newUserId, city]);
      con.query(query3, function (err, response) {
        if (err) throw err;
        res.redirect("/login");
      });
    });
  });
});

router.get("/city", function (req, res) {
  var getQuery =
    "select * from user inner join user2 on user.driving = user2.driving where userId = ?";
  var getQuery2 = mysql.format(getQuery, [userauth]);
  con.query(getQuery2, function (err, response) {
    first = response[0].first;
    last = response[0].last;
    if (err) throw err;
    // res.render("city", {
    //   first: first,
    //   last: last,
    // });
    var getQuery2 = "select cityName from branch2";
    con.query(getQuery2,function(err,response)
    {
      console.log(response);
      res.render("city", {
      first: first,
      last: last,
      response:response,
    });
    })
  });
});
var selectedBranchId;

var cityName;
var branches;
var branches2;

router.post("/booking", function (req, res) {
  cityName = req.body.city;
  var query =
    "select * from branch inner join branch2 on branch.cityId=branch2.cityId where branch2.cityName = ?";
  var getQuery2 = mysql.format(query, [cityName]);
  // console.log(getQuery2);
  con.query(getQuery2, function (err, response) {
    if (err) throw err;
    branches = response;
    res.redirect("/branches");
  });
});

router.get("/branches", function (req, res) {
  res.render("branches", {
    branches: branches,
  });
});

var cars;

router.get("/branch/:id", function (req, res) {
  var branchId = req.params.id;
  var query =
    "select * from car inner join car2 on car.carName = car2.carName where car.branchId = ?";
  var getQuery2 = mysql.format(query, [branchId]);
  con.query(getQuery2, function (err, response) {
    if (err) throw err;
    cars = response;
    console.log(cars);
    res.render("cars", {
      cars: cars,
    });
  });
});

var priceOne;
var priceFive;
var priceSix;

router.get("/userBooking/:id", function (req, res) {
  selectedCar = req.params.id;
  var getQuery = "select * from car where carId = ?";
  var getQuery2 = mysql.format(getQuery, [selectedCar]);
  con.query(getQuery2, function (err, response) {
    if (err) throw err;
    priceOne = response[0].priceOne;
    priceFive = response[0].priceFive;
    priceSix = response[0].priceSix;
    var query12 =
      "select * from booking join details on booking.bookingId = details.bookingId where booking.carId = ?";
    var getQuery12 = mysql.format(query12, [response[0].carId]);
    con.query(getQuery12, function (err, response) {
      if (err) throw err;
      car = response;
      res.render("userBooking", {
        car: car,
      });
    });
  });
});

var totalAmount;
var paymentId;
var extraCharges;
var gst;
var finalAmount;
var bookingId;
var requestedHours;
var d;
var f;

router.post("/userBooking", function (req, res) {
  var fromTime = req.body.fromTime;
  var toTime = req.body.toTime;

  var number;

  d = new Date(toTime);
  f = new Date(fromTime);
  console.log(fromTime);
  console.log(toTime);
  console.log(f);
  console.log(d);
  var getQuery123 =
    " select count(booking.carId) from booking join details on booking.bookingId = details.bookingId where booking.carId = ? and ((fromTime >= ? ) or (toTime <= ? )) ";
  var getQuery124 = mysql.format(getQuery123, [selectedCar, toTime, fromTime]);
  var getQuery125 =
    "select count(booking.carId) from booking join details on booking.bookingId = details.bookingId where booking.carId = ?";
  var getQuery126 = mysql.format(getQuery125, [selectedCar]);
  con.query(getQuery126, function (err, response) {
    if (err) throw err;
    number = response[0]["count(booking.carId)"];
    // console.log("***********");
    // console.log(number);
    // console.log("***********");
  });
  console.log(getQuery124);
  con.query(getQuery124, function (err, response) {
    if (err) throw err;
    console.log(response[0]["count(booking.carId)"]);
    if (response[0]["count(booking.carId)"] != number) {
      res.render("clashing", {
        selectedCar: selectedCar,
      });
    } else if (response[0]["count(booking.carId)"] == number) {
      var getQuery = "insert into `details` (`fromTime`,`toTime`) VALUES (?,?)";
      var getQuery2 = mysql.format(getQuery, [fromTime, toTime]);
      con.query(getQuery2, function (err, response) {
        if (err) throw err;
        bookingId = response.insertId;
        res.redirect("/payment");
      });
    }
  });
});

router.get("/payment", function (req, res) {
  var getQuery3 =
    "insert into `booking` (`userId`,`carId`,`bookingId`) VALUES (?,?,?)";
  var getQuery4 = mysql.format(getQuery3, [userauth, selectedCar, bookingId]);
  con.query(getQuery4, function (err, response) {
    if (err) throw err;
    requestedHours = (d - f) / 3600000;
    if (requestedHours <= 1) {
      totalAmount = priceOne;
    }
    if (requestedHours <= 5) {
      totalAmount = priceFive * requestedHours;
    } else {
      totalAmount = priceSix * requestedHours;
    }
    extraCharges = Math.floor(totalAmount * 0.1);
    gst = Math.floor(totalAmount * 0.18);
    finalAmount = Math.floor(gst + extraCharges + totalAmount);
    totalAmount = Math.floor(totalAmount);
    res.render("payment", {
      extraCharges: extraCharges,
      totalAmount: totalAmount,
      gst: gst,
      finalAmount: finalAmount,
      priceOne: priceOne,
      priceFive: priceFive,
      priceSix: priceSix,
    });
  });
});

router.get("/success", function (req, res) {
  var getQuery4 =
    "insert into `payment` (`amountPaid`,`extraCharges`,`gst`) values (?,?,?)";
  var getQuery5 = mysql.format(getQuery4, [finalAmount, extraCharges, gst]);
  con.query(getQuery5, function (err, response) {
    if (err) throw err;
    paymentId = response.insertId;
    // console.log(response);
    var getQuery6 =
      "insert into `return` (`userId`,`carId`,`paymentId`) values(?,?,?)";
    var getQuery7 = mysql.format(getQuery6, [userauth, selectedCar, paymentId]);
    // console.log(getQuery7);
    con.query(getQuery7, function (err, response) {
      if (err) throw err;
      // console.log(response);
      res.render("success");
    });
  });
});

router.get("/history", function (req, res) {
  
  var query =
    "select car.carName,branch.branchName,details.bookingTime,details.fromTime,details.toTime from booking join details using(bookingId) join car using(carId) join branch using(branchId) where booking.userId= ? ";
  var query2 = mysql.format(query, [userauth]);
  con.query(query2, function (err, response) {
    if (err) throw err;
    console.log(response);
    res.render("history", {
      response: response,
    });
  });
});

router.post("/adminlogin", function (req, res) {
  if (authenticated == false) {
    var email = req.body.email;
    var password = req.body.password;
    var check = "Select * from user where email = ? and password = ?";
    var queryCheck = mysql.format(check, [email, password]);
    con.query(queryCheck, function (err, response) {
      if (err) throw err;
      if (response == "") {
        res.redirect("/adminlogin");
      } else if (
        response[0].userId == 1 ||
        response[0].userId == 2 ||
        response[0].userId == 3
      ) {
        // console.log(response[0].userId);
        authenticated = true;
        userauth = response[0].userId;
        res.render("adminhome");
      } else {
        res.redirect("/adminlogin");
      }
    });
  }
  else {
    res.render("adminhome");
  }
});

router.get("/addBranch", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query =
      "select * from branch join branch2 on branch.cityId = branch2.cityId ";
    var query2 = mysql.format(query);
    con.query(query2, function (err, response) {
      if (err) throw err;
      res.render("addBranch", {
        response: response,
      });
    });
  }
});

router.post("/addBranch", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var cityId = req.body.cityId;
    var newBranch = req.body.newBranch;
    var newBranchId = req.body.newBranchId;
    var pincode = req.body.pincode;
    var address = req.body.picture;
    var maps = req.body.maps;
    var query =
      "insert into branch (branchId,cityId,branchName,pincode,address,maps) values(?,?,?,?,?,?)";
    var query2 = mysql.format(query, [
      newBranchId,
      cityId,
      newBranch,
      pincode,
      address,
      maps,
    ]);

    con.query(query2, function (err, response) {
      if (err) throw err;
      res.render("adminhome");
    });
  }
});

router.get("/addCar", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query = "select carName from car2";
    con.query(query, function (err, response) {
      if (err) throw err;
      res.render("addCar", {
        response: response,
      });
    });
  }
});

router.post("/addCar", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var carName = req.body.carName;
    var carDetails = req.body.carDetails;
    var image1 = req.body.image1;
    var image2 = req.body.image2;
    var image3 = req.body.image3;
    var query =
      "insert into car2 (carName,carDetails,image1,image2,image3) values(?,?,?,?,?)";
    var query2 = mysql.format(query, [
      carName,
      carDetails,
      image1,
      image2,
      image3,
    ]);
    con.query(query2, function (err, response) {
      if (err) throw err;
      res.render("adminhome");
    });
  }
});

router.get("/addCarBranch", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query =
      "select carId,carName,car.branchId,branchName from car join branch on branch.branchId =car.branchId";
    var query2 = mysql.format(query);
    con.query(query2, function (err, response) {
      if (err) throw err;
      res.render("addCarBranch", {
        response: response,
      });
    });
  }
});

router.post("/addCarBranch", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var carId = req.body.carId;
    var carName = req.body.carName;
    var priceOne = req.body.priceOne;
    var priceFive = req.body.priceFive;
    var priceSix = req.body.priceSix;
    var branchId = req.body.branchId;
    var query =
      "insert into car (carId,carName,priceOne,priceFive,priceSix,branchId) values(?,?,?,?,?,?)";
    var query2 = mysql.format(query, [
      carId,
      carName,
      priceOne,
      priceFive,
      priceSix,
      branchId,
    ]);
    con.query(query2, function (err) {
      if (err) throw err;
      res.render("adminhome");
    });
  }
});

//select user2.first,user2.last,user.userId,car.carId,details.bookingId,car.carName,details.fromTime,details.toTime from booking join user on user.userId = booking.userId join user2 on user.driving = user2.driving join car on car.carId = booking.carId join details on details.bookingId = booking.bookingId

//SELECT user.userId,user2.first,user2.last,payment.amountPaid,payment.extraCharges,payment.gst FROM `return` natural join user natural join user2 natural join payment

router.get("/bookingAllUsers", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query =
      "select user2.first,user2.last,user.userId,car.carId,details.bookingId,car.carName,details.fromTime,details.toTime from booking join user on user.userId = booking.userId join user2 on user.driving = user2.driving join car on car.carId = booking.carId join details on details.bookingId = booking.bookingId";
    var query2 = mysql.format(query);
    con.query(query2, function (err, response) {
      if (err) throw err;
      // console.log(response)
      res.render("bookingsAllUsers", {
        response: response,
      });
      
    });
  }
});

router.get("/paymentsAllUsers", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query =
      "SELECT user.userId,user2.first,user2.last,payment.amountPaid,payment.extraCharges,payment.gst,payment.paymentId FROM `return` natural join user natural join user2 natural join payment";
    var query2 = mysql.format(query);
    con.query(query2, function (err, response) {
      if (err) throw err;
      res.render("paymentsAllUsers", {
        response: response,
      });
    
      
    });
  }
});

router.get("/deleteBranch", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query =
      "select branchId,branchName,cityName from branch join branch2 on branch.cityId =branch2.cityId ";
    var query2 = mysql.format(query);
    con.query(query2, function (err, response) {
      if (err) throw err;
      res.render("deleteBranch", {
        response: response,
      });
    });
  }
});

router.post("/deleteBranch", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var branchId = req.body.branchId;
    var deleteQuery = "delete from branch where branchId = ?";
    var query = mysql.format(deleteQuery, branchId);
    con.query(query, function (err) {
      if (err) throw err;
      res.render("adminhome");
    });
  }
});

router.get("/deletecar", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var query =
      "select * from car join branch on car.branchId =branch.branchId ";
    var query2 = mysql.format(query);
    con.query(query2, function (err, response) {
      if (err) throw err;
      // console.log(response);
      res.render("deleteCar", {
        response: response,
      });
    });
  }
});

router.post("/deleteCar", function (req, res) {
  if (authenticated == false) {
    res.redirect("/adminlogin");
  } else {
    var carId = req.body.carId;
    var deleteQuery = "delete from car where carId = ?";
    var query = mysql.format(deleteQuery, carId);
    con.query(query, function (err) {
      if (err) throw err;
      res.render("adminhome");
    });
  }
});

module.exports = router;

//
// select * from car JOIN branch on car.branchId = branch.branchId join booking on booking.carId = car.carId where car.carId = 10
//
