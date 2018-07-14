DROP DATABASE IF EXISTS bamazondb;
create database bamazondb;
use bamazondb;

create table products (
	productID int not null,
    productname varchar(45) null,
    departmentname varchar(45) null,
    price int(10) null,
    stockquantity int(10) null,
    productsales int(10) null,
    primary key (productID)
);
create table departments (
	departmentid int not null,
    departmentname varchar(45) null,
    overheadcosts int(10) null,
    primary key (departmentid)
);
insert into products (productID, productname, departmentname, price, stockquantity, productsales) values (100123, "Playstaion 4", "Electonics", 400, 10, 0), (201365, "Bannanas", "Food", 3, 50, 0), (102136, "Far Cry 3", "Electonics", 60, 10, 0), (100124, "X-Box 1", "Electonics", 400, 10, 0), (100659, "GTA-5", "Electonics", 60, 15, 0), (100845, "MineCraft", "Electonics", 20, 20, 0), (326598, "Cap'n Crunch", "Food", 4, 35, 0), (245862, "Graphic Tee", "Clothes", 6, 2, 0);
insert into departments (departmentid, departmentname, overheadcosts) values(1, "Electonics", 1000), (2, "Food", 50), (3, "Clothes", 100);