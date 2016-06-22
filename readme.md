# Schlr

This is just a little "custom todo" app I put together to achieve two small goals:

1. Test out the [Foundation for Apps](http://foundation.zurb.com/apps.html) framework in a real app.
2. Make a todo app that would help me keep track of my weekly assignments, quizzes, and such for ongoing college courses.

It has all of the makings of a todo app, but it organizes and tracks the data in a way that works better with my personal preference, by sorting the items into the following hierarchy:

- Terms (e.g. Spring 2015, Summer 2016, etc)
  - Weeks (e.g. "Summer 2016, week 1")
     - Courses (e.g. "Uber 1337 JavaScript 101")

So each week will have sub-headers for each course I am currently taking, and a todo item for each task I need to complete for that week. Each has a counter showing incomplete items, and once they are all completed, it is marked as such.

This was mostly built around my own personal preferences, so it's tough to say if anyone will get any use of it, but you are welcome to do with it as you please. Most of the authentication and CRUD code was written against a Stamplay back-end, so if you choose to try to work with it, you may find the need to re-work some of that code.

## Technologies Used

The primary technology used is [Foundation for Apps](http://foundation.zurb.com/apps.html), which is a pretty hefty framework. Other notable mentions:

- AngularJS 1.4
- TypeScript
- Sass/SCSS
- Lodash

I also used Stamplay for authentication and database. Rather than using their SDK, I opted to simply write my own calls against their API, which in hindsight was a huge mistake. :)

## Structure

- The primary src directory is `client/assets/js`. It's all TypeScript, but I still use the 'js' directory name out of habit and convention.
- HTML templates are all in `client/templates`.
- Everything else should probably be pretty self-explanatory.
