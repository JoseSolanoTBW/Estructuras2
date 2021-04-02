require('file-loader?name=[name].[ext]!./assets/images/favicon.ico')
const api = require('./neo4jApi');

$(function () {
  renderGraph();
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
});

function showMovie(name) {
  api
    .getMovie(name)
    .then(car => {
      if (!car) return;

      $("#title").text(car.title);
      $("#poster").attr("src", car.img);
      const $list = $("#crew").empty();

      if(car.type){
        $list.append($("<p>" + "Autos disponibles de la marca:  "+ car.title + "</p>"));
        car.cars.forEach(c => {
          $list.append($("<li>" + c.name + "</li>"));
        });
        $list.append($("<p>" + "Agencias donde se vende la marca:  "+ car.title + "</p>"));
        car.agencies.forEach(c => {
          $list.append($("<li>" + c.title + "</li>"));
        });
      }else{
        $list.append($("<p>" + "Agencias donde se vende el modelo:  "+ car.title + "</p>"));
        car.agencies.forEach(c => {
          $list.append($("<li>" + c.title + "</li>"));
        });
        if(car.agents.length != 0 && car.agents[0].name != null){
          $list.append($("<p>" + "Agentes que venden el modelo:  "+ car.title + "</p>"));
          car.agents.forEach(c => {
            $list.append($("<li> Nombre: " + c.name + "  Correo: "+ c.email +"  Tel: "+ c.phone+"</li>"));
          });
        }
        if(car.types.length != 0 && car.types[0].title != null){
          $list.append($("<p>" + "Caracterísitcas del auto:  "+ car.title + "</p>"));
          car.types.forEach(c => {
            $list.append($("<li> Tipo: " + c.title + ",  Puertas: "+ c.doors +"</li>"));
          });
        }
        
      }
      
    }, "json");
}

function search() {
  const query = $("#search").find("input[name=search]").val();
  api
    .searchMovies(query)
    .then(cars => {
      const t = $("table#results tbody").empty();

      if (cars) {
        cars.forEach(car => {
          $("<tr><td><img src="+ car.image +" /></td><td class='movie'>" + car.name + "</td><td>" + car.publish.low + "</td><td>" + (car.price == "" ? "Esto es una marca" : car.price) + "</td></tr>").appendTo(t)
            .click(function() {
              showMovie($(this).find("td.movie").text());
            })
        });

        const first = cars[0];
        if (first) {
          showMovie(first.name);
        }
      }
    });
}


function renderGraph() {
  const width = 800, height = 800;
  const force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  const svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      const link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      const node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}
