import React, { Component } from 'react';
//Putting Clarfai on front end poses security issue
//(apiKey is sent out in the open), so it has been moved to the backend
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions = {
    particles: {
        number: {
            value: 38,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
};

const initialState = {
    input: '',
    imageURL: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
};

class App extends Component {
  constructor(){
      super();
      this.state = initialState;
    }
    
  loadUser = (data) => {
      this.setState({ user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
      } });
  }
    
  calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
      };
  }
  
  displayBoxedFace = (inBox) => {
      this.setState({box: inBox});
  }
    
  onInputChange = (event) => {
      this.setState({input: event.target.value});
  }
  
  onButtonSubmit = () => {
      this.setState({imageURL: this.state.input});
      fetch('http://localhost:3000/imageurl', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              input: this.state.input
          })
      })
        .then(response => response.json())
        .then(response => {
          if(response) { //updates entries if response
              fetch('http://localhost:3000/image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.user.id
                    })
              })
                .then(response => response.json())
                .then(count => {
                    this.setState(Object.assign(this.state.user, { entries: count }))
                }).catch(console.log)
          }
          this.displayBoxedFace(this.calculateFaceLocation(response))
      }).catch(err => console.log(err));
  }
  
  onRouteChange = (routeShift) => {
      if(routeShift === 'signout'){
          this.setState(initialState);
      } else if(routeShift === 'home') {
          this.setState({isSignedIn: true});
      }
      this.setState({route: routeShift});
  }
  
  render() {
    const {isSignedIn, route, imageURL, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
         params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' //If this.state.route === 'home' is true, go to main app page
            ?  <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                <ImageLinkForm 
                    onInputChange={this.onInputChange} 
                    onButtonSubmit={this.onButtonSubmit} 
                />
                <FaceRecognition box={box} imageURL={imageURL} />
              </div> 
            //Else...
            : (
                route === 'signin' || route === 'signout' //If this.state.route === 'signin' is true, go to signin page
                ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> //Else go to register page
              )
        }
      </div>
    );
  }
}

export default App;
