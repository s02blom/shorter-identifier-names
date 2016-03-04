# Shorter Identifier Names Take Longer to Comprehend - Results

This repository contains the data obtained during the experiment reported here:

[Shorter identifier names take longer to comprehend](http://ieeexplore.ieee.org/document/7884623/)

Participants answered questionnaires and participated in six trials.
In each trial, they saw a snippet of C# code, where identifier names had been changed to contain either letters, abbreviations or words. The first three trials contained a semantic defect, whereas the last three trials contained a syntax error.

In this repository you will find everything to reason about our results.

 - ```instructions``` contains all pages with information for participants, including instructions for the upcoming tasks. They are in JSON format to be loaded in JavaScript, because we had used a custom built web application available [here](https://github.com/brains-on-code/peter) to display these pages.
 - ```questionnaires``` contains all the questions we asked the participants. Questionnaire 3 was shown AFTER the experiment. The files are written in a custom markdown dialect and can be viewed with any text editor. They can be automatically translated to HTML using [Antwort](https://github.com/empathic-code/antwort).
 - ```snippets``` contains the original stimulus material. The original codes were automatically generated from unit-tested, working codes, and the errors were placed in the snippets automatically. The html files were transformed and displayed with basic Visual Studio Syntax Highlighting using CSS in the final app.
 - ```results``` Contains our raw data.

# Results

| File               | Contains                           |
|--------------------|------------------------------------|
| events.csv         | Keypresses during the experiment   |
| forms.csv          | Submitted formdata,                |
| trials.csv         | Participant answers to each trial  |


# Note
Please note that the study was conducted with a sample of German C# developers.
We had conducted a pretest to understand our stimulus material, which was conducted in English, and thus some instructions slightly differ between the German and English versions.

If you have further questions about how to interpret these data, please let me know, I would be happy to discuss this with you.
 - Johannes Hofmeister (shorter-code [äht] spam.cessor.de)
