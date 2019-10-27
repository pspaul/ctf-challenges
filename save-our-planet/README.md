# Save Our Planet
**Category:** Web  
**Points:** 500  
**Solves:** 5  

## Description
Save our planet, one blocked element at a time! With [our new tool](https://fluxfingersforfuture.fluxfingers.net/static/chall/saveourplanet_7eb362d293fd52ed339b81704e879c3a.zip), we will block everything that wastes your data and your energy. If you find anything we should add, [let us know](https://saveourplanet.fluxfingersforfuture.fluxfingers.net/). Contributors can claim a reward [here](http://flag/).

## Exploit
See [exploit.html](exploit/exploit.html).

## Functionality
A Firefox extension that blocks "bad" elements, kind of like an ad blocker.

```
+-----------------+         +-------------------+         +-------+
| Content Script  |         | Background Script |         | Popup |
| (in every page) |         |                   |         |       |
+--------+--------+         +---------+---------+         +---+---+
         |                            |                       |
         |       send content         |                       |
         |       on page load         |                       |
         +--------------------------->+                       |
         |                            |                       |
         | report back: good or bad   |                       |
         | (incl IDs of bad elements) |                       |
         +<---------------------------+                       |
         |                            |                       |
         |       report back if       |                       |
         |   something was removed    |   forward info about  |
         +--------------------------->+      removed stuff    |
         |                            +---------------------->+
         |                            |                       |
         +                            +                       +
```
