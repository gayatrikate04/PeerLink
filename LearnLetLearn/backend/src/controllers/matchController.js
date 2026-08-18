const User = require('../models/User');
const Match = require('../models/Match');

function performKMeansClustering(users, k = 3, maxIterations = 20) {
  if (users.length === 0) return [];
  const effectiveK = Math.min(k, users.length);
  const skillVocabulary = Array.from(new Set(
    users.flatMap(u => [...(u.skillsKnown || []), ...(u.skillsToLearn || [])])
  ));

  if (skillVocabulary.length === 0) {
    return users.map(u => ({ userId: u._id, name: u.name, clusterId: 0, clusterName: 'Archetype Group 1' }));
  }
  const vectors = users.map(user => {
    const knownSet = new Set(user.skillsKnown || []);
    const learnSet = new Set(user.skillsToLearn || []);
    const vector = skillVocabulary.map(skill => {
      if (knownSet.has(skill)) return 1;
      if (learnSet.has(skill)) return -1;
      return 0;
    });
    return { user, vector };
  });

  let centroids = vectors.slice(0, effectiveK).map(v => [...v.vector]);
  let assignments = new Array(vectors.length).fill(0);


  const euclideanDistance = (vecA, vecB) => {
    return Math.sqrt(vecA.reduce((sum, val, idx) => sum + Math.pow(val - vecB[idx], 2), 0));
  };


  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    vectors.forEach((item, idx) => {
      let minDist = Infinity;
      let clusterIdx = 0;
      centroids.forEach((centroid, cIdx) => {
        const dist = euclideanDistance(item.vector, centroid);
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = cIdx;
        }
      });
      if (assignments[idx] !== clusterIdx) {
        assignments[idx] = clusterIdx;
        changed = true;
      }
    });

    if (!changed) break;
    for (let cIdx = 0; cIdx < effectiveK; cIdx++) {
      const clusterVectors = vectors.filter((_, idx) => assignments[idx] === cIdx);
      if (clusterVectors.length > 0) {
        centroids[cIdx] = skillVocabulary.map((_, dim) => {
          const sum = clusterVectors.reduce((acc, item) => acc + item.vector[dim], 0);
          return sum / clusterVectors.length;
        });
      }
    }
  }

  return vectors.map((item, idx) => ({
    userId: item.user._id,
    name: item.user.name,
    email: item.user.email,
    skillsKnown: item.user.skillsKnown,
    skillsToLearn: item.user.skillsToLearn,
    clusterId: assignments[idx],
    clusterName: `Skill Archetype Group ${assignments[idx] + 1}`
  }));
}

exports.findMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const allUsers = await User.find({});
    
    const clusteredUsers = performKMeansClustering(allUsers, 3);
    const clusterMap = new Map(clusteredUsers.map(u => [u.userId.toString(), u]));

    const users = allUsers.filter(u => u._id.toString() !== currentUser._id.toString());
    const matches = [];

    users.forEach(user => {
      const learnFromOther = currentUser.skillsToLearn.filter(skill => user.skillsKnown.includes(skill));
      const teachToOther = currentUser.skillsKnown.filter(skill => user.skillsToLearn.includes(skill));
      
      if (learnFromOther.length > 0 && teachToOther.length > 0) {
        const matchScore = learnFromOther.length + teachToOther.length;
        const userInfo = clusterMap.get(user._id.toString()) || {};
        
        matches.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          learnFromOther,
          teachToOther,
          matchScore,
          clusterId: userInfo.clusterId ?? 0,
          clusterName: userInfo.clusterName ?? 'Skill Archetype Group 1'
        });
      }
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSkillClusters = async (req, res) => {
  try {
    const allUsers = await User.find({});
    const clusters = performKMeansClustering(allUsers, 3);

    const groupedClusters = clusters.reduce((acc, user) => {
      acc[user.clusterName] = acc[user.clusterName] || [];
      acc[user.clusterName].push(user);
      return acc;
    }, {});

    res.json({
      success: true,
      totalUsers: allUsers.length,
      clusters: groupedClusters
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during clustering', error: err.message });
  }
};
