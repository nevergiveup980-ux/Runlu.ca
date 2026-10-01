import SwiftUI

struct LaunchView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(spacing: 12) {
                Image(systemName: "drop.fill")
                    .font(.system(size: 54, weight: .semibold))
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(.blue)

                Text("RUNLU")
                    .font(.system(size: 34, weight: .bold, design: .rounded))

                Text("NEXT")
                    .font(.headline)
                    .tracking(5)
                    .foregroundStyle(.secondary)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("RUNLU NEXT")
        }
    }
}
