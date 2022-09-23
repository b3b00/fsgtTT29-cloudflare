module.exports.getTemplate = function() {
    let tpl = `<!DOCTYPE html>
    <html>
    
    <head>
        <script
      src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
      integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8="
      crossorigin="anonymous"></script>
      <title>FSGT 29 TT calendars</title>  
    </head>
    <script>
    changeGroup = function(group) {
      teamsByGroup =  <%=teamsByGroup%>  
      groupSelect = $('#groups');
      group = groupSelect.val();
      teamList = teamsByGroup[group];
    
      $('#teams').children('option').remove();
    
      for (var i=0; i<teamList.length; i++) {
            team = teamList[i];        
            $("#teams").append(\`<option value="\${team.Name}" >\${team.Name}</option>\`);        
        }
    
    }
    
    function download() {
      teams = document.getElementById("teams");
      groups = document.getElementById('groups');
    
      group = groups.value;
      team = teams.value;
      shortTeam = team != null ? team.replace(" ", "").toLocaleLowerCase() : "";
      if (shortTeam == "" || group == "") {
        window.alert("vous devez d'abord choisir un group et une &eacute;quipe !");
        return;
      }
      downloader = document.getElementById("downloader");
      downloader.src=\`/calendars/\${group}/\${shortTeam}\`;
      console.log(\`download \${group} - \${shortTeam}\`)
    }
    
    </script>
    <body>
    
    <iframe id="downloader" style="display:none"></iframe>
    
    
    
        
        <h1>charger votre calendrier FSGT  TT 29</h1>
        <label for="groups">Groupes : </label>
        <select id="groups" onchange="changeGroup();">
          <option value="">S&eacute;lectionner un groupe</option>
          <%=groupsOptions%>     
        </select>
        <br><br>
        <label for="teams">&eacute;quipe :</label>
        <select id="teams">      
          <option value="">S&eacute;lectionner une &eacute;quipe</option>
        </select><br><br>
        <button onclick="download();">t&eacute;l&eacute;charger le calendrier</button>
        
    
    
    
    
    </body>
    </html>
    `;
    return tpl;
  }