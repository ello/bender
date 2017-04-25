# FAILURES
# don't let testing shortcuts get into master by accident
fail('.only left in test suite') if `grep -r -e '\w\.only' test/`.length > 0

# Make sure all npm dependencies are locked down
package_json = JSON.parse(File.read('package.json'))
fail('Lock down package versions') if package_json['dependencies'].values.any? { |l| l =~ /("\~\d|"\^\d|"\>\d|"\>\=\d|"\<\d|"\<\=\d)/ }

