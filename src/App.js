import React, { Component } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Home from './components/Home';
import CustomerList from './components/CustomerList';
import MovieSearch from './components/MovieSearch';
import MovieLibrary from './components/MovieLibrary';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

const BASE_URL = 'http://localhost:3000/'

class App extends Component {
  constructor() {
    super();
    this.state = {
      movies: [],
      selectMovie: undefined,
      customers: [],
      selectedCustomer: undefined,
      error: undefined,
    };
  }

  componentDidMount() {
    axios.get(`${BASE_URL}/customers`)
    .then((response) => {
      const customers = response.data;
      this.setState({
        customers,
        error: undefined
      });
    })

    .catch ((error) => {
      this.setState({ 
        error: error.message 
      });
    });

    axios.get(`${BASE_URL}/movies`)
    .then((response) => {
      const movies = response.data;
      this.setState({ 
        movies,
        error: undefined
      });
    })

    .catch((error) => {
      this.setState({ 
        error: error.message 
      });
    });
  }

  //To add new movie to dabat base
  addMovie = (movieToAdd) => {
    if (!this.state.movies.find(movie => movie.external_id === movieToAdd.external_id)) {
      axios.post(`${BASE_URL}/movies`, movieToAdd)
      .then((response) => {
        const { movies } = this.state;
        movies.push(movieToAdd)
        this.setState({
          movies,
        });
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
    }
  }

  selectMovie = (id, title, overview, release_date, image_url, external_id) => {
    const { movies } = this.state;

    const selectedMovie = movies.find((movie) => {
      return movie.id === id;
    })

    this.setState({ selectedMovie })
  }
  
  selectCustomer(id) {
    const { customers } = this.state;
    const selectedCustomer = customers.find((customer) => {
      return customer.id === id;
    })
    this.setState({ selectedCustomer })
  }

  createRental() {
    if(this.state.selectedMovie) {
      const movieTitle = this.state.selectedMovie.title
      const customerId = this.state.selectedCustomer.id
      let dueDate = new Date()
      dueDate.setDate(new Date().getDate() + 5 );

      const params = {
        customer_id: customerId,
        due_date: dueDate.toISOString(), 
      }

      axios.post(`${BASE_URL}/rentals/${movieTitle}/check-out`, params)
      .then((response) => {

        this.setState({
          selectedMovie: undefined,
          selectedCustomer: undefined,
          error: undefined,
        })
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
    }
  }
  selectedItemClass() {
    if (this.state.selectedCustomer || this.state.selectedMovie) {
      return "items-selected"
    } else {
      return "no-items-selected"
    }
  }
  render() {
    return (
      <Router>
      <div className="App">
        <div className="sidenav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/customers">Customers</Link>
            </li>
            <li>
              <Link to="/library">Movie Library</Link>
            </li>
            <li>
              <Link to="/search">Movie Search</Link>
            </li>
          </ul>

          <div className={this.selectedItemClass()}>
            {this.state.selectedMovie ? ("Selected Movie: \n" + this.state.selectedMovie.title) : "" }
            <br />
            {this.state.selectedCustomer ? ("Selected Customer: \n" + this.state.selectedCustomer.name) : "" }
            <br />
            {this.state.selectedMovie && this.state.selectedCustomer ? <Button className="btn-secondary" onClick={() => this.createRental()}>Create a Rental</Button> : ''}
          </div>
        </div>

        <div className="main">
          <Switch>
            <Route exact path="/">
              <Home movieList={this.state.movies}/>
            </Route>
            <Route path="/customers">
              <CustomerList customerList={this.state.customers} selectCustomer={(id) => this.selectCustomer(id)} />
            </Route>
            <Route path="/library">
              <MovieLibrary movieList={this.state.movies} selectMovie={(id) => this.selectMovie(id)}/>
            </Route>
            <Route path="/search">
              <MovieSearch url={BASE_URL} selectMovie={(id) => this.selectMovie(id)} addMovie={(movie) => this.addMovie(movie)} movieList={this.state.movies} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
    );
  }
}

export default App;
