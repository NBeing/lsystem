// https://paulbourke.net/fractals/lsys/

let pause = false;
function mousePressed() {
  if (pause == false) {
    noLoop();
    pause = true;
  } else {
    loop();
    pause = false;
  }
}


const meanings = {
  // move in
  "F": (config) => {
    let {
      axiom,
      rules,
      meanings,
      length,
      theta,
      iterations,
      current_x,
      current_y,
      current_angle
    } = config

    const next_x =
      (current_x) + (length * Math.cos(current_angle))
    // we flip the y axis because in p5 land, 
    // positive means "go down"
    // but in math land, negative means "go up"
    const next_y =
      (current_y) + (-length * Math.sin(current_angle))

    line(
      current_x,
      current_y,
      next_x,
      next_y,
    )
    // im too stoned
    // return {...config, ...{ next_x, next_y}}
    config.current_x = next_x
    config.current_y = next_y
    return config
  },

  "+": (config) => {
    // angle is in radians, and we want to change the angle in the direction
    config.current_angle = config.current_angle + config.theta
    return config
  },
  "-": (config) => {
    // angle is in radians, and we want to change the angle in the direction
    config.current_angle = config.current_angle - config.theta
    return config
  },
  "|": (config) => {
    // reverse current angle
    config.current_angle = config.current_angle + Math.PI
    return config
  },
  "[": (config) => {
    config.stack.push({
      current_x: config.current_x,
      current_y: config.current_y,
      current_angle: config.current_angle,
    })

    return config
  },
  "]": (config) => {
    const previous_state = config.stack.pop(config)
    config.current_x = previous_state.current_x
    config.current_y = previous_state.current_y
    config.current_angle = previous_state.current_angle

    return config
  }
}
//  10,10,PI                    20,20,PI/2             ...   20,20.PI/2     
//  [                   F F F + [                          ] F           ] FF
//   angle1 pushed to stack     angle 2 pushed to stack                       
// write more

const drawTheThing = (config) => {
  let {
    axiom,
    rules, // how to rewrite each token
    meanings, // what each token "does"
    length,  // line length
    theta, // theta
    iterations,      // iterations
    current_x, //starting_point_x,
    current_y, //starting_point_y
    current_angle,
    stack
  } = config

  const rewrite = (_axiom, rules, tmp = []) => {
    // if there are remaining tokens in the axiom
    _axiom = Array.from(_axiom)
    if (_axiom.length) {
      // take the first token of the axiom and pop it off
      const head = _axiom.shift()
      // check if there is a rule for the token we just popped off
      if (Object.keys(rules).includes(head)) {
        // retrieve the rule and push it to our tmp array
        Array.from(rules[head]).forEach(char => {
          tmp.push(char)
        })
      } else {
        tmp.push(head)
      }
      // and then do it again until....
      return rewrite(_axiom.join(""), rules, tmp)
    } else {
      // we have no more left! So we turn the array into a string 
      return tmp
    }
  }

  const fullyIterated =
    // We just want to run it iterations time, but js doesnt give us
    // a range function
    // So this will just run iterations # of times
    // our array looks like [0,1]
    // Reduce is going to start with the axiom as cur 
    [...Array(iterations).keys()]
      .reduce((acc, _) => rewrite(acc, rules, []), axiom);

  Array.from(fullyIterated.join("")).forEach(symbol => {
    if (meanings[symbol]) {
      config = meanings[symbol](config)
    }

  })
}

const drawTheThingIterative = (config) => {
  let {
    axiom,
    rules, // how to rewrite each token
    meanings, // what each token "does"
    length,  // line length
    theta, // theta
    iterations,      // iterations
    current_x, //starting_point_x,
    current_y, //starting_point_y
    current_angle,
    stack
  } = config

  const rewrite = (rules, axiom) => {
    let tmp = []
    for (let i = 0; i < axiom.length; i++) {
      let current = axiom[i]
      if (rules[current]) {
        tmp.push(rules[current])
      } else {
        tmp.push(current)
      }
    }
    tmp = tmp.reduce((acc, cur) => {
      acc = acc.concat(cur)
      return acc

    }, "")
    return tmp
  }
  for (let j = 0; j < iterations; j++) {
    axiom = rewrite(rules, axiom)
  }


  Array.from(axiom).forEach(symbol => {
    // console.log("Looking at", meanings, symbol, config)
    if (meanings[symbol]) {
      config = meanings[symbol](config)
    }

  })
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(127)
  strokeWeight(2)
}

function draw() {
  fill(0)
  rect(0, 0, width, height)
  stroke(0,64,64)
  strokeWeight(2)
  try {
    // The Tree
    let axiom = "X"
    let rules = {
      "F": "FF",
      "X": "F-[[X]+X]+F[+FX]-X"
    }
    let theta = Math.PI / 8

    // axiom = "F+F+F+F"
    // rules= {"F": "FF+F-F+F+FF"}
    // theta = Math.PI / 2
    let length = 10 
    let iterations = 5
    let current_x = mouseX
    let current_y = mouseY
    let current_angle = 2 * Math.PI

    drawTheThingIterative({
      axiom,
      rules, // how to rewrite each token
      meanings, // what each token "does"
      length,  // line length
      theta, // theta
      iterations,      // iterations
      current_x, //starting_point_x,
      current_y, //starting_point_y.
      current_angle,
      stack: [],
    })

  } catch (e) {
    console.log("error:", e)
  }
}

