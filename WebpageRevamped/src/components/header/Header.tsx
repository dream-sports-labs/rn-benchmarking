import React from 'react'
import favicon from '../../assets/icons/dream11-logo.svg'
import './Header.css'

const Header = () => {
  return (
    <div className={'HeaderContainer'}>
      <img src={favicon} alt={'Dream11 Logo'} width={20} height={20} />
      <div className={'HeaderTitle'}>React Native Benchmarking</div>
    </div>
  )
}

export default Header
