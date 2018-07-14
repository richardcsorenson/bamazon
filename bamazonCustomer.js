var mysql = require("mysql");
var inquirer = require("inquirer");
var cart = [];
var runningTotal = 0;
function cartItem(item, quant, price){
    this.item = item;
    this.quant = quant;
    this.price = price;
}
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazondb"
  });

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    mainMenu();   
});
function mainMenu(){
    inquirer.prompt([{
        type: "list",
        message: "Main Menu",
        choices: [
            "Shop",
            "Check Cart",
            "Exit"
        ],
        name: "userInput"
    }]).then(function(inquirerResponse){
        switch(inquirerResponse.userInput){
            case("Shop"):
                shop();
            break;
            case("Check Cart"):
                checkCart();
            break;
            case("Exit"):
                connection.end();
                return;
            break;
        }
    });
};

function shop(){
    inquirer.prompt([{
        type: "list",
        message: "Where would you like to shop?",
        choices: [
            "Electonics",
            "Food",
            "Clothes",
            "Return to Main Menu"
        ],
        name: "userInput"
    }]).then(function(inquirerResponse){
        var area = inquirerResponse.userInput;
        if(area === "Return to Main Menu"){
            mainMenu();
        }
        else{
            shopArea(area);
        }
    });
};

function shopArea(area){
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var idarr = [];
        for(var i = 0; i < res.length; i++){
            if(res[i].departmentname === area){
                console.log("Item ID: " + res[i].productID + " | Product Name: " + res[i].productname + " | Price: $" + res[i].price);
                idarr.push(res[i].productID);
            }
        }
        inquirer.prompt([{
            type: "input",
            message:"Please enter the Item ID of the product you wish to buy, enter 0 to exit",
            default: "0",
            name: "userInput"
        }]).then(function(inqres){
            if(inqres.userInput === "0"){
                mainMenu();
            }
            else{
                var checkValue = false;
                var num = 0;
                    for(var j = 0; j < idarr.length; j++){
                        if(inqres.userInput == idarr[j]){
                            checkValue = true;
                            num = j;
                        }
                    }
                
                if(checkValue){
                    inquirer.prompt([{
                        type: "input",
                        message:"Please enter the quantity of units you wish to purchase",
                        default: "0",
                        name: "userInput"
                    }]).then(function(inquirerResponse){
                        if (inquirerResponse.userInput <= res[num].stockquantity){
                            var newCartItem = new cartItem(res[num].productname, inquirerResponse.userInput, res[num].price);
                            cart.push(newCartItem);
                            var newquantity = res[num].stockquantity - inquirerResponse.userInput;
                            connection.query("UPDATE products SET ? WHERE ?",[{stockquantity: newquantity}, {productname: res[num].productname}], function(error, response){
                                if(error) throw (error);
                            });
                            mainMenu();
                        }
                        else{
                            console.log("Sorry we don't have enough inventory to cover that order");
                            mainMenu();
                        }
                    });
                }
                else{
                    console.log("So sorry, that Item ID doesn't seem to be in our database, please check your input and try again, if you have already double checked your input\nplease contact one of our managers at (555)555-5555");
                    mainMenu();
                }
            }
        });
    });
}

function checkCart(){
    runningTotal = 0;
    for (var i = 0; i < cart.length; i++){
        console.log("Item number " + (i + 1) + ": " + cart[i].item + ", number of items " + cart[i].quant + ", price per item $" + cart[i].price);
        runningTotal+= (cart[i].quant * cart[i].price);
    }
    console.log("Current total is $" + runningTotal);
    inquirer.prompt([{
        type:"list",
        message:"What whould you like to do?",
        choices:[
            "Continue Shopping",
            "Remove Item from Cart",
            "Proceed to Checkout",
            "Return to Main Menu"
        ],
        name:"userChoice"
    }]).then(function(userRes){
        var choice = userRes.userChoice;
        switch(choice){
            case("Continue Shopping"):
                shop();
            break;
            case("Remove Item from Cart"):
                removeCartItem();
            break;
            case("Proceed to Checkout"):
                checkOut();
            break;
            case("Return to Main Menu"):
                mainMenu();
            break;
        }
    });
}

function removeCartItem(){
    runningTotal = 0;
    for (var i = 0; i < cart.length; i++){
        console.log("Item number " + (i + 1) + ": " + cart[i].item + ", number of items " + cart[i].quant + ", price per item $" + cart[i].price);
        runningTotal+= (cart[i].quant * cart[i].price);
    }
    inquirer.prompt([{
        type: "input",
        message: "Which item(s) whould you like to remove? (Please enter cart item number)",
        name: "cartRemove"
    }]).then(function(cartRemoveRes){
        var newCheck = parseInt(cartRemoveRes.cartRemove);
        if (newCheck === NaN){
            console.log("So sorry, but you seem to have entered in the information incorrectly, please contact one of our managers at\n(555)555-5555 if you need assistance");
            mainMenu();
        }
        else if (newCheck < 1 || newCheck > cart.length){
            console.log("So sorry, but you seem to have entered in the information incorrectly, please contact one of our managers at\n(555)555-5555 if you need assistance");
            mainMenu();
        }
        else{
            newCheck = newCheck - 1;
            var temp = 0;
            connection.query("SELECT * FROM products", function(err, res) {
                if(error) throw (error);
                for (var i = 0; i < res.length; i++){
                    if(res[i].productname === cart[newCheck].item){
                        temp = res[i].stockquantity;
                    }
                }
            });
            temp = cart[newCheck].quant + temp;
            connection.query("UPDATE products SET ? WHERE ?",[{stockquantity: temp}, {productname: cart[newCheck].item}], function(error, response){
                if(error) throw (error);
            });
            cart.splice(newCheck, 1);
            checkCart();
        }
    });
}

function checkOut(){
    runningTotal = 0;
    for (var i = 0; i < cart.length; i++){
        runningTotal+= (cart[i].quant * cart[i].price);
    }
    console.log("The total due today is $" + runningTotal + "\nThis will be deducted from you bamazon account and your items will arrive withing the next 3 to 5 buisness days");
    console.log("Thank you for shopping with bamazon");
    return;
}