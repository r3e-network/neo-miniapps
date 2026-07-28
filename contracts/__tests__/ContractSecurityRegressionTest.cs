using Xunit;

namespace NeoMiniAppPlatform.Contracts.Tests
{
    /// <summary>
    /// Security-audit regressions for contracts this repo owns. The platform ran
    /// these while the sources lived there; they moved with the sources, so a
    /// change here can fail them.
    /// </summary>
    public class ContractSecurityRegressionTest
    {
        [Fact]
        public void AuditFixC2_QuadraticFundingBlocksSelfContribute()
        {
            // Audit fix C-2: round creator and project owner are prohibited from
            // contributing. The guard sits in MiniAppQuadraticFunding.Projects.cs
            // alongside an audit-fix comment for traceability.
            string projects = ContractSourceAssertions.ReadSource(
                "contracts", "MiniAppQuadraticFunding", "MiniAppQuadraticFunding.Projects.cs");
            Assert.Contains("contributor != project.Owner", projects);
            Assert.Contains("contributor != round.Creator", projects);
            Assert.Contains("owner cannot contribute", projects);
            Assert.Contains("round creator cannot contribute", projects);

            // FinalizeRound must reject the round creator as a finalizer — only the
            // gateway or platform admin may finalize.
            string methods = ContractSourceAssertions.ReadSource(
                "contracts", "MiniAppQuadraticFunding", "MiniAppQuadraticFunding.Methods.cs");
            Assert.Contains("fromGateway || Runtime.CheckWitness(Admin())", methods);
            Assert.DoesNotContain(
                "fromGateway || Runtime.CheckWitness(round.Creator) || Runtime.CheckWitness(Admin())",
                methods);
        }

    }
}
