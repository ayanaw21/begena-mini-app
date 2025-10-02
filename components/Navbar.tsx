import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'

const Navbar = () => {
  return (
     <nav className="h-30 border-b border-gray-700 w-full flex justify-between items-center px-10">
        <h1 className="text-xl text-amber-400 font-bold">በገና</h1>
        <div className="flex items-center">
          <Link href={"/"}>
            <Button className="font-bold text-amber-400 border border-amber-900 bg-gray-900 hover:bg-amber-900">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>
  )
}

export default Navbar