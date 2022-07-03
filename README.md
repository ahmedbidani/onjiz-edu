# Kindie - Kindergarten management application
Check the document: http://zinisoft.net/kindie/compatibility-requirements/



## CHANGE LOG
### V2.4.2
> * Backend: Fixed chat error no data when typing

### V2.4.1 
> * Menu and schedule is not reloaded when clicking on another item (frontend)
> * Fix: Module title for frontpage does not display.

### V2.4.0 
> * Updated: Frontend now parent can login with account proviced.
> * Updated: View schedule + menu of a class
> * Fix: backend upload image with empty value 

### V2.3.0
> * Add: Fix format structure to work with SaaS version (this is still for single school)
> * Updated: API student health data log (by monthly )
> * Updated: Fix CSRF tocken (for backend)
> * Updated: Attendance statistic
> * Enhanced: Dashboard UI 
> * Enhanced: Import menu + schedule 


### V2.1.1
> * Add: Captcha in login form (install recaptcha-v3, querystring).
> * Add: Option to send notification.

### V2.1.0
> * Add: Support multi branch
> * Add: Event module: manage daily school events

### V2.0.0
> * Add: Frontend UI, now parent and teacher can track all the information on Web View
> * Add: Support multi branch
> * Add: Event module: manage daily school events

### V1.2.3
> * Update: module attendance & pick up.
> * Add: notification for message.
> * Fix: send notifications for day off module.
> * Fix: active day in calander menu + schedule.
> * Update: regex phone number.

### V1.2.1
> * Fix: module fee invoice.
> * Add: currency management.
> * Add: setting for fee invoice.
> * Update: multi-language.

### V1.2
> * Add module fee invoice.

###  V1.1
> * Add role for School Admin.
> * Add notification for pickup.
> * Fix multiple language for notification.
> * Fix dashboard.

###  V1.0.1
> * Fix filter album by classroom when choose classroom.
> * Fix set maximum upload limition for app

###  COMMANDLINE EXPORT DATABASE
mongodump

###  COMMANDLINE IMPORT DATABASE
mongorestore --drop --host localhost --db kindie [PATH_TO_DB_FOLDER]
mongorestore --drop --host localhost --db kindiedb E:\NodeJS\web-kindie\db\kindiedb