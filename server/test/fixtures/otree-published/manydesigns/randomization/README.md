#ManyDesigns: Competition and Moral Behavior
---

### Software set up by Project Coordinators
---


This repository contains the _oTree_ software as set up by the Project Coordinators. All participants recruited via _Prolific_ landed on this common study before being redirected to 
one of the 45 individual experimental designs as set-up by the Research Teams. 

The software contains:

- a welcome screen,
- a captcha,
- a consent form, and 
- a common attention check question.

If a participant fails the attention check question, she cannot continue with the study. 

After the last screen, JavaScript is used to redirect participants to one of 90 (45 designs × 2 treatments) individual treatments in batches of four participants, 
i.e., four participants in a row were redirected to the same treatment of the same experiment/design. We randomly assigned the first 45 × 2 = 90 batches of four 
participants (i.e., the first 360 participants) to each of the 90 treatments (i.e., one batch per treatment); and so on for the next 90 batches, etc.
The seed for the randomization was changed for each session (line 32 in `redirect/__init__.py`).

A demo of the software is available here: [manydesigns.herokuapp.com](http://manydesigns.herokuapp.com/)

---

The software runs on _oTree_ 5.7.1 using _Python_ 3.9.9 and the _scipy_ 1.7.1 package.
