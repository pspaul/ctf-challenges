-- create the db with unicode support
CREATE DATABASE `rpdg`;
-- ALTER DATABASE `rpdg` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `rpdg`;

-- create the tables
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `pwhash` VARCHAR(255) NOT NULL
);
CREATE TABLE `tracking` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(16) NOT NULL,
    `timestamp` LONG NOT NULL,
    `user` INT NOT NULL,
    `path` VARCHAR(4095) NOT NULL,
    FOREIGN KEY (user) REFERENCES users(id)
);
CREATE TABLE `culture` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `year` INT NOT NULL
);

-- create the app user
CREATE USER 'rpdg'@'%' IDENTIFIED WITH mysql_native_password BY 'Luung4aithaiCh3aetho';
-- ALTER USER 'rpdg'@'%' IDENTIFIED WITH mysql_native_password BY 'Luung4aithaiCh3aetho';
REVOKE ALL PRIVILEGES ON *.* FROM 'rpdg'@'%';
GRANT SELECT ON `rpdg`.`tracking` TO 'rpdg'@'%';
GRANT SELECT ON `rpdg`.`culture` TO 'rpdg'@'%';

-- create a special user for login-related stuff
CREATE USER 'rpdg-login'@'%' IDENTIFIED WITH mysql_native_password BY 'muLuqueiL7hiekei7roo';
-- ALTER USER 'rpdg-login'@'%' IDENTIFIED WITH mysql_native_password BY 'muLuqueiL7hiekei7roo';
REVOKE ALL PRIVILEGES ON *.* FROM 'rpdg-login'@'%';
GRANT SELECT ON `rpdg`.`users` TO 'rpdg-login'@'%';

FLUSH PRIVILEGES;

-- create the internet culture data
INSERT INTO `culture` (`title`, `link`, `year`) VALUES
('Kranfuehrer Ronny', 'https://www.youtube.com/watch?v=UGlPbphlpBg', 2016),
('Thueringer Kloesse', 'https://www.youtube.com/watch?v=qJe3cdM7f1c', 2012),
('Fichtls Lied', 'https://www.youtube.com/watch?v=dP9Wp6QVbsk', 2012),
('Nudeln', 'https://www.youtube.com/watch?v=ouMuU5PXNvU', 2008),
('Hauptschule', 'https://www.youtube.com/watch?v=IXarjKOrv00', 2010),
('Blumenkohl', 'https://www.youtube.com/watch?v=hFNs5JGGmvI', 2009),
('Bim Bam Bum', 'https://www.youtube.com/watch?v=koymOv6SifE', 2007),
('KS Mafia', 'https://www.youtube.com/watch?v=YQalL7jeT0o', 2012),
('Gesicherter Bereich', 'https://www.youtube.com/watch?v=71DdxJF8rmg', 2016),
('Gewitter', 'https://www.youtube.com/watch?v=PCc7NuDB8mo', 2012),
('Haben wir noch Peps?', 'https://www.youtube.com/watch?v=Ko81Oedo4t8', 2014),
('Nicht so tief Ruediger', 'https://www.youtube.com/watch?v=NseWRQ1JYoM', 2010),
('Andreas', 'https://www.youtube.com/watch?v=C1fCJvgNDow', 2011),
('Wo bist du, mein Sonnenlicht', 'https://www.youtube.com/watch?v=Mue6Vc_T9Ds', 2006),
('Schokolade', 'https://www.youtube.com/watch?v=WuQOfiD7gNg', 2009),
('Voll Assi Toni', 'https://www.youtube.com/watch?v=f4ffzhNOh1s', 2010),
('Zur Party', 'https://www.youtube.com/watch?v=3VyEWthLklc', 2012),
('Erdbeerkaese', 'https://www.youtube.com/watch?v=08lgAZP4CSk', 2011),
('Was ist denn mit Karsten los', 'https://www.youtube.com/watch?v=J2v0EG--tr0', 2009),
('Reifenverlust', 'https://www.youtube.com/watch?v=Lo05D-_k1d4', 2007),
('Fickende Leute in meinem Garten', 'https://www.youtube.com/watch?v=mEXItEgKWwQ', 2011),
('Alarm', 'https://www.youtube.com/watch?v=erTE5mEOMeI', 2016),
('Kuchenblech', 'https://www.youtube.com/watch?v=NtRGMIahxPo', 2013),
('Boar alta geil ey, unnormal ey!', 'https://www.youtube.com/watch?v=_H2B7pFIRwY', 2010);
