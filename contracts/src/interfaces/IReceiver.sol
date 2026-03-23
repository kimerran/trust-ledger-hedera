// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IReceiver
/// @notice Legacy interface — previously used for Chainlink CRE DON reports.
///         Kept for reference. AuditAnchor no longer implements this interface.
///         Direct calls to anchorDecision() are used instead.
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata rawReport) external;
    function supportsInterface(bytes4 interfaceId) external pure returns (bool);
}
