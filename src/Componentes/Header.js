import React from 'react'
import logo from '../logo_final_softinova.ico';

const Header = props => {
    return (
        <header className="header">
            <img src={logo} height="80px" alt="logo" />
            <h1 className="App-title">SHERLOCK</h1>
        </header>
    )
}

export default Header