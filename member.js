function skillsMember() {
  return {
    restrict: 'E',
    templateUrl: '/templates/skills/views/member.html',
    controller: 'SkillsMemberController',
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      member: '='
    }
  };
}