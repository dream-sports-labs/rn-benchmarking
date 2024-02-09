import Foundation
import React

import UIKit

class RNTPerformanceView: UIView {
  @objc var tagName: String = ""
  
  override func draw(_ rect: CGRect) {
    super.draw(rect)

    let endTime = String(Date().timeIntervalSince1970 * 1000)
    PerformanceLoggerStorage.logger.addEndTime(name: tagName, timestamp: endTime)
    }
}

@objc (RNPerformanceView)
class RNTPerformanceViewManager: RCTViewManager {
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  public override func view() -> UIView! {
    return RNTPerformanceView()
  }
}
