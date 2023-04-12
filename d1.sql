drop table if exists mytable;
create table mytable (id INT PRIMARY KEY, value TEXT);
INSERT INTO mytable(id,value) VALUES(1,'one'),(2,'two'),(3,'three');
drop table if exists calendars;
create table calendars (groupe TEXT, team TEXT, calendar TEXT, PRIMARY KEY(groupe,team));
