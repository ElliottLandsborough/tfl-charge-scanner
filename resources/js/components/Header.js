// resources/assets/js/components/Header.js

import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Render the header
 */
const Header = () => (
  <nav className='navbar navbar-expand-md navbar-light navbar-laravel'>
    <div className='container'>
      <h1><Link className='navbar-brand' to='/'>TFL Charge Scanner</Link></h1>
    </div>
  </nav>
)

export default Header
