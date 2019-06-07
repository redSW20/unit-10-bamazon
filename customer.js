var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',//Enter your db password here
    database: 'bamazon_db'
});

// Initial function to run the application
function init(){
    displayItems();
}

// Function to display items available
function displayItems(){
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity > 0'
    },
        function (error, results) {
            if (error) throw error;
            results.forEach(element => {
                console.log("Item ID: " + element.item_id + " || Item: " + element.product_name + " || Price: $" + element.price + " || Quantity: " + element.stock_quantity);
            });
            selectItem();
        });
};

// Prompts the user for the id of the item they'd like to purchase
function selectItem() {
    inquirer
        .prompt([
            {
                name: "id",
                message: "Please enter the id of the item you'd like to purchase: ",
                type: "input",
                validate: function validateNumber(id){
                    if(!parseInt(id)) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            selectQuantity(parseInt(answers.id));
        });
};

// Prompts the user for the quantity of the item they'd like to purchase
function selectQuantity(id){
    inquirer
        .prompt([
            {
                name: "quantity",
                message: "Please enter the quantity you'd like to purchase: ",
                type: "input",
                validate: function validateNumber(quantity){
                    if(!parseInt(quantity)) return false;
                    return true;
                }
            }
        ])
        .then(answers => {
            validateOrder(id,parseInt(answers.quantity));
        });
};

function validateOrder(id,quantity){
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity >= ? AND item_id=?',
        values: [quantity,id]
    },
        function (error, results) {
            if (error) throw error;
            if(!results.length){
                console.log("Insufficient Quantity");
                connection.end();
                return;
            }
            var totalPrice = toFixedTrunc((parseFloat(results[0].price)*quantity),2);
            var newQuantity = results[0].stock_quantity-quantity;
            var newSales = parseFloat(results[0].product_sales)+parseFloat(totalPrice);
            console.log("Your order costs a total of: $" + totalPrice);
            updateDb(newQuantity,id,newSales);
        });
};

function updateDb(newQuantity,id,newSales){
    connection.query({
        sql: 'UPDATE products SET stock_quantity=?,product_sales=? WHERE item_id=?',
        values: [newQuantity, newSales,id]
    },
        function (error, results) {
            if (error) throw error;
            connection.end();
        });
};

// Borrowed from Stackoverflow, lots of answers but this one seemed most accurate to solve issue I was having.

// https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding/11818658

function toFixedTrunc(value, n) {
    const v = value.toString().split('.');
    if (n <= 0) return v[0];
    let f = v[1] || '';
    if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
    while (f.length < n) f += '0';
    return `${v[0]}.${f}`
};

init();
