import Foundation
let fm = FileManager.default
let base = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString)
try fm.createDirectory(at: base.appendingPathComponent("Actual.app/Web"), withIntermediateDirectories: true)
try fm.createSymbolicLink(at: base.appendingPathComponent("Alias.app"), withDestinationURL: base.appendingPathComponent("Actual.app"))
try Data().write(to: base.appendingPathComponent("Actual.app/Web/twist.html"))
try Data().write(to: base.appendingPathComponent("outside.html"))
let bundle = base.appendingPathComponent("Alias.app")
let file = base.appendingPathComponent("Actual.app/Web/twist.html")
func old(_ url: URL) -> Bool { url.isFileURL && url.standardizedFileURL.path.hasPrefix(bundle.path + "/") }
func fixed(_ url: URL) -> Bool {
 guard url.isFileURL else { return false }
 return url.resolvingSymlinksInPath().standardizedFileURL.path.hasPrefix(bundle.resolvingSymlinksInPath().standardizedFileURL.path + "/")
}
assert(!old(file)); assert(fixed(file))
assert(fixed(bundle.appendingPathComponent("Web/twist.html")))
assert(!fixed(base.appendingPathComponent("Actual.app-evil/Web/twist.html")))
assert(!fixed(URL(string:"https://runlu.ca/twist.html")!))
try fm.createSymbolicLink(at: base.appendingPathComponent("Actual.app/Web/escape"), withDestinationURL: base)
assert(!fixed(bundle.appendingPathComponent("Web/escape/outside.html")))
print("PASS: old policy rejects symlink alias; fixed accepts both identities and rejects sibling, remote, escaping symlink")
try fm.removeItem(at:base)
