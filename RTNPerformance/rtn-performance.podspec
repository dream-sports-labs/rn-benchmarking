require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name            = "rtn-performance"
  s.version         = package["version"]
  s.summary         = package["description"]
  s.description     = package["description"]
  s.homepage        = "https://github.com/mistryswapnil"
  s.license         = package["license"]
  s.platforms       = { :ios => "11.0" }
  s.author          = "swapnilmistry1997@gmail.com"
  s.source          = { :git => package["repository"], :tag => "#{s.version}" }

  s.source_files    = "ios/**/*.{h,m,mm,swift}"

  install_modules_dependencies(s)
end