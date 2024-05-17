<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personal Page</title>
    <style>
        body {
            background-color: #FFCC99; /* Pastel orange background */
            color: #000000; /* Black text color */
            font-family: 'Cambria', serif; /* Cambria font */
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: auto;
            padding: 20px;
            border-radius: 8px; /* Rounded corners */
        }

        /* Tabs container styling */
        .tabs {
            overflow: hidden;
            background: #f1f1f1; /* Light grey background for tabs */
            font-family: 'Cambria', serif;
            border-radius: 8px; /* Rounded corners for tabs */
        }

        .tab {
            float: left;
            cursor: pointer;
            padding: 14px 16px;
            transition: background-color 0.3s;
            border: none; /* No border for individual tabs */
            outline: none;
            text-align: center;
        }

        /* Change background color of tabs on hover */
        .tab:hover {
            background-color: #ddd; /* Lighter grey for hover */
        }

        /* Style for the active tab */
        .tab.active {
            background-color: #ccc; /* Even lighter grey for active tab */
        }

        .tab-content {
            padding: 20px;
            border: 1px solid #ddd; /* Light grey border for content */
            border-top: none; /* No top border to merge with tabs */
        }

        h1, h2 {
            color: #333333; /* Dark grey color for headings */
        }

        p {
            line-height: 1.6; /* Spacing between lines */
        }

        a {
            color: #0056b3; /* Blue color for links */
            text-decoration: none; /* No underline on links */
        }

        a:hover {
            text-decoration: underline; /* Underline on hover */
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Personal Page</h1>
        <div class="tabs">
            <button class="tab active" onclick="openTab(event, 'Main')">Main</button>
            <button class="tab" onclick="openTab(event, 'Research')">Research</button>
            <button class="tab" onclick="openTab(event, 'CV')">CV</button>
        </div>

        <div id="Main" class="tab-content" style="display: block;">
            <h2>About Me</h2>
            <p>Hello, I am [Your Name]. Welcome to my personal page. Here, you can find more about my hobbies, work, and some of the projects I've been working on.</p>
            <p>I am a [Your Profession] with a passion for [Your Passion]. I've been involved in [Brief Description of Your Experience or Projects].</p>
        </div>

        <div id="Research" class="tab-content" style="display: none;">
            <h2>My Research</h2>
            <p>Here is some information about my research works:</p>
            <ul>
                <li><a href="#">Research Topic One</a> - Description of Research One.</li>
                <li><a href="#">Research Topic Two</a> - Description of Research Two.</li>
                <li><a href="#">Research Topic Three</a> - Description of Research Three.</li>
            </ul>
        </div>

        <div id="CV" class="tab-content" style="display: none;">
            <h2>My Curriculum Vitae (CV)</h2>
            <p>Here are some highlights of my CV:</p>
            <ul>
                <li><a href="#">Link to my detailed CV</a> - Alternatively, a brief overview can go here.</li>
            </ul>
        </div>
    </div>

    <script>
        // Function to switch between tabs
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            // Get all elements with class="tab-content" and hide them
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            // Get all elements with class="tab" and remove the class "active"
            tablinks = document.getElementsByClassName("tab");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            // Show the current tab, and add an "active" class to the button that opened the tab
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }
    </script>
</body>
</html>
