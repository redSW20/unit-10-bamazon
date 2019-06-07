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